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

	@Override
	public void subscribeToProgress(Long submissionId) {
		String channel = "progress:" + submissionId;
		
		if (activeSubscriptions.containsKey(submissionId)) {
			log.info("Already subscribed to progress: {}", submissionId);
			return;
		}
		
		MessageListenerAdapter listenerAdapter = new MessageListenerAdapter(this, "onMessage");
		redisMessageListenerContainer.addMessageListener(listenerAdapter, new ChannelTopic(channel));
		activeSubscriptions.put(submissionId, listenerAdapter);

		ScheduledFuture<?> timeoutTask = scheduledExecutorService.schedule(() -> {
			unsubscribeFromProgress(submissionId);
		}, 5, TimeUnit.MINUTES);

		timeoutTasks.put(submissionId, timeoutTask);

		log.info("Subscribed to Redis channel: {}", channel);
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
			throw new RuntimeException(e);
		}

		eventPublisher.publishEvent(progressEvent);
	}
}
