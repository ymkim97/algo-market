package algomarket.problemservice.adapter.messaging;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.application.required.ProgressSubscriber;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisProgressSubscriber implements ProgressSubscriber, MessageListener {

	private final RedisTemplate<String, Object> redisTemplate;
	private final RedisMessageListenerContainer redisMessageListenerContainer;
	private final ApplicationEventPublisher eventPublisher;
	private final ObjectMapper objectMapper;

	private final ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(2);
	private final Map<Long, ScheduledFuture<?>> timeoutTasks = new ConcurrentHashMap<>();
	private final Map<Long, MessageListenerAdapter> activeSubscriptions = new ConcurrentHashMap<>();

	@PreDestroy
	public void shutdown() {
		scheduledExecutorService.shutdownNow();
	}

	@Override
	public void subscribeToProgress(Long submissionId) {
		String channel = "progress:" + submissionId;

		activeSubscriptions.computeIfAbsent(submissionId, id -> {
			MessageListenerAdapter listenerAdapter = new MessageListenerAdapter(this, "onMessage");
			redisMessageListenerContainer.addMessageListener(listenerAdapter, new ChannelTopic(channel));

			log.info("Subscribed to Redis channel: {}", channel);

			return listenerAdapter;
		});

		scheduleInactivityTimeout(submissionId);
	}

	@Override
	public void unsubscribeFromProgress(Long submissionId) {
		ScheduledFuture<?> timeoutTask = timeoutTasks.remove(submissionId);
		if (timeoutTask != null && !timeoutTask.isDone()) {
			timeoutTask.cancel(false);
		}

		MessageListenerAdapter listenerAdapter = activeSubscriptions.remove(submissionId);
		
		if (listenerAdapter != null) {
			String channel = "progress:" + submissionId;
			redisMessageListenerContainer.removeMessageListener(listenerAdapter, new ChannelTopic(channel));
			log.info("Unsubscribed from Redis channel: {}", channel);
		}
	}

	@Override
	public void onMessage(Message message, byte[] pattern) {
		String channel = redisTemplate.getStringSerializer().deserialize(message.getChannel());
		String body = redisTemplate.getStringSerializer().deserialize(message.getBody());

		log.info("Received message from Redis - Channel: {}, Body: {}", channel, body);

		ProgressEvent progressEvent;

		try {
			progressEvent = objectMapper.readValue(body, ProgressEvent.class);
		} catch (JsonProcessingException e) {
			log.error("Failed to parse progress event", e);
			return;
		}

		if (progressEvent == null) {
			log.warn("Null ProgressEvent received from Redis. channel: {}, body: {}", channel, body);
			return;
		}

		eventPublisher.publishEvent(progressEvent);
		scheduleInactivityTimeout(progressEvent.submissionId());
	}

	private void scheduleInactivityTimeout(Long submissionId) {
		ScheduledFuture<?> prev = timeoutTasks.remove(submissionId);
		if (prev != null && !prev.isDone()) prev.cancel(false);

		ScheduledFuture<?> next = scheduledExecutorService.schedule(
			() -> unsubscribeFromProgress(submissionId), 5, TimeUnit.MINUTES);

		timeoutTasks.put(submissionId, next);
	}
}
