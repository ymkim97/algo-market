package algomarket.problemservice.adapter.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.domain.submission.SubmitStatus;

@SpringBootTest
@Testcontainers
@Import(RedisProgressSubscriberTest.TestEventCapturer.class)
class RedisProgressSubscriberTest {

	@Container
	static GenericContainer<?> redis = new GenericContainer<>("redis:8.2.1-alpine")
		.withExposedPorts(6379)
		.waitingFor(Wait.forListeningPort())
		.withStartupTimeout(Duration.ofSeconds(60));

	@DynamicPropertySource
	static void configureProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.data.redis.host", redis::getHost);
		registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
	}

	@Autowired
	RedisProgressSubscriber redisProgressSubscriber;

	@Autowired
	RedisTemplate<String, Object> redisTemplate;

	@Autowired
	ObjectMapper objectMapper;

	@Autowired
	TestEventCapturer testEventCapturer;

	List<ProgressEvent> progressEvents;

	@BeforeEach
	void setUp() {
		progressEvents = testEventCapturer.getProgressEvents();
		progressEvents.clear();
	}

	@Test
	void subscribeToProgress() throws JsonProcessingException, InterruptedException {
		// given
		Long submissionId = 1L;
		String channel = "progress:" + submissionId;

		// when
		redisProgressSubscriber.subscribeToProgress(submissionId);

		var testEvent = new ProgressEvent(
			submissionId,
			"testUser",
			SubmitStatus.JUDGING,
			50,
			5,
			10,
			LocalDateTime.now()
		);

		String eventJson = objectMapper.writeValueAsString(testEvent);
		redisTemplate.convertAndSend(channel, eventJson);

		// 이벤트 처리 대기
		Thread.sleep(500);

		// then
		assertThat(progressEvents.size()).isEqualTo(1);

		// cleanup
		redisProgressSubscriber.unsubscribeFromProgress(submissionId);
	}

	@Test
	void subscribeToProgress_duplicateSubscription_shouldNotSubscribeTwice() {
		// given
		Long submissionId = 2L;

		// when
		redisProgressSubscriber.subscribeToProgress(submissionId);
		redisProgressSubscriber.subscribeToProgress(submissionId);

		// then
		// 로그를 통해 중복 구독이 무시되었는지 확인

		// cleanup
		redisProgressSubscriber.unsubscribeFromProgress(submissionId);
	}

	@Test
	void unsubscribeFromProgress() throws JsonProcessingException, InterruptedException {
		// given
		Long submissionId = 3L;
		String channel = "progress:" + submissionId;

		redisProgressSubscriber.subscribeToProgress(submissionId);

		// when
		redisProgressSubscriber.unsubscribeFromProgress(submissionId);

		var testEvent = new ProgressEvent(
			submissionId,
			"testUser",
			SubmitStatus.JUDGING,
			50,
			5,
			10,
			LocalDateTime.now()
		);

		String eventJson = objectMapper.writeValueAsString(testEvent);
		redisTemplate.convertAndSend(channel, eventJson);

		// 이벤트 처리 대기
		Thread.sleep(500);

		// then
		assertThat(progressEvents.size()).isZero();
	}

	@Test
	void timeoutUnsubscription_shouldUnsubscribeAfterTimeout() {
		// given
		Long submissionId = 4L;

		var mockExecutor = Mockito.mock(ScheduledExecutorService.class);
		var mockFuture = Mockito.mock(ScheduledFuture.class);

		when(mockExecutor.schedule(any(Runnable.class), eq(5L), eq(TimeUnit.MINUTES)))
			.thenAnswer(invocation -> {
				Runnable task = invocation.getArgument(0);
				task.run();

				return mockFuture;
			});

		ReflectionTestUtils.setField(redisProgressSubscriber, "scheduledExecutorService", mockExecutor);

		// when
		redisProgressSubscriber.subscribeToProgress(submissionId);

		// then
		verify(mockExecutor).schedule(any(Runnable.class), eq(5L), eq(TimeUnit.MINUTES));

		// cleanup
		redisProgressSubscriber.unsubscribeFromProgress(submissionId);
	}

	@TestConfiguration
	static class TestEventCapturer {

		private final List<ProgressEvent> progressEvents = new ArrayList<>();

		@EventListener
		public void handleProgressEvent(ProgressEvent event) {
			progressEvents.add(event);
		}

		public List<ProgressEvent> getProgressEvents() {
			return progressEvents;
		}
	}
}
