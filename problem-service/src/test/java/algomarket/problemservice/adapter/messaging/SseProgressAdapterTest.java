package algomarket.problemservice.adapter.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.domain.submission.SubmitStatus;

@SuppressWarnings("unchecked")
class SseProgressAdapterTest {

	SseProgressAdapter sseProgressAdapter;

	@BeforeEach
	void setUp() {
		sseProgressAdapter = new SseProgressAdapter();
	}

	@Test
	void saveSubscription() {
		// given
		String username = "testUser";
		Long submissionId = 1L;

		// when
		var emitter = sseProgressAdapter.saveSubscription(username, submissionId);

		// then
		assertThat(emitter).isNotNull();
		assertThat(emitter.getTimeout()).isEqualTo(60 * 1000L);

		var emitters = (Map<String, SseEmitter>) ReflectionTestUtils.getField(sseProgressAdapter, "emitters");
		assertThat(emitters).hasSize(1);
		assertThat(emitters).containsKey("testUser:1");
	}

	@Test
	void saveSubscription_WithMultipleDifferentUsers() {
		// given
		String username1 = "user1";
		String username2 = "user2";
		Long submissionId = 1L;

		// when
		var emitter1 = sseProgressAdapter.saveSubscription(username1, submissionId);
		var emitter2 = sseProgressAdapter.saveSubscription(username2, submissionId);

		// then
		assertThat(emitter1).isNotEqualTo(emitter2);

		var emitters = (Map<String, SseEmitter>) ReflectionTestUtils.getField(sseProgressAdapter, "emitters");
		assertThat(emitters).hasSize(2);
		assertThat(emitters).containsKey("user1:1");
		assertThat(emitters).containsKey("user2:1");
	}

	@Test
	void notifyProgressUpdate_success() {
		// given
		String username = "testUser";
		Long submissionId = 1L;

		sseProgressAdapter.saveSubscription(username, submissionId);

		var progressEvent = new ProgressEvent(
			submissionId,
			username,
			SubmitStatus.JUDGING,
			50,
			5,
			10,
			LocalDateTime.now()
		);

		// when
		sseProgressAdapter.notifyProgressUpdate(username, submissionId, progressEvent);

		// then
		var emitters = (Map<String, SseEmitter>) ReflectionTestUtils.getField(sseProgressAdapter, "emitters");
		assertThat(emitters).hasSize(1);
	}

	@Test
	void completeProgress() {
		// given
		String username = "testUser";
		Long submissionId = 1L;

		sseProgressAdapter.saveSubscription(username, submissionId);

		// when
		sseProgressAdapter.completeProgress(username, submissionId, SubmitStatus.ACCEPTED);

		// then
		var emitters = (Map<String, SseEmitter>) ReflectionTestUtils.getField(sseProgressAdapter, "emitters");
		assertThat(emitters).isEmpty();
	}

	@Test
	void emitterError_shouldRemoveFromMap() throws IOException {
		// given
		String username = "testUser";
		Long submissionId = 1L;

		var mockEmitter = mock(SseEmitter.class);
		var testException = new IOException("Test exception");

		doThrow(testException).when(mockEmitter).send(any(SseEmitter.SseEventBuilder.class));

		var emitters = (Map<String, SseEmitter>) ReflectionTestUtils.getField(sseProgressAdapter, "emitters");
		emitters.put(username + ":" + submissionId, mockEmitter);

		var progressEvent = new ProgressEvent(
			submissionId,
			username,
			SubmitStatus.JUDGING,
			50,
			5,
			10,
			LocalDateTime.now()
		);

		// when
		sseProgressAdapter.notifyProgressUpdate(username, submissionId, progressEvent);

		// then
		assertThat(emitters).isEmpty();
		verify(mockEmitter).completeWithError(testException);
	}
}
