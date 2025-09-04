package algomarket.problemservice.adapter.messaging;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.application.required.ProgressNotifier;
import algomarket.problemservice.domain.submission.SubmitStatus;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SseProgressAdapter implements ProgressNotifier {

	@Value("${sse.timeout-ms}")
	private Long sseTimeoutMs;
	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	@Override
	public SseEmitter saveSubscription(String username, Long submissionId) {
		String emitterKey = username + ":" + submissionId;

		SseEmitter existingEmitter = emitters.get(emitterKey);
		if (existingEmitter != null) {
			log.info("Already existing emitter for submission: {}", submissionId);
			return existingEmitter;
		}

		SseEmitter emitter = new SseEmitter(sseTimeoutMs);
		SseEmitter prev = emitters.putIfAbsent(emitterKey, emitter);

		if (prev != null) {
			return prev;
		}

		emitter.onCompletion(() -> {
			log.info("SSE connection completed for: {}", emitterKey);
			emitters.remove(emitterKey);
		});
		
		emitter.onTimeout(() -> {
			log.info("SSE connection timed out for: {}", emitterKey);
			emitters.remove(emitterKey);
		});
		
		emitter.onError(throwable -> {
			log.error("SSE connection error for: {}", emitterKey, throwable);
			emitters.remove(emitterKey);
		});
		
		try {
			emitter.send(SseEmitter.event()
				.name("connected")
				.data("Connected to submission progress for: " + submissionId));
		} catch (IOException e) {
			log.error("Failed to send initial connection event", e);
			emitters.remove(emitterKey);
			emitter.completeWithError(e);
		}
		
		return emitter;
	}

	@Override
	public void notifyProgressUpdate(String username, Long submissionId, ProgressEvent progressEvent) {
		String emitterKey = username + ":" + submissionId;
		SseEmitter emitter = emitters.get(emitterKey);
		
		if (emitter != null) {
			try {
				emitter.send(SseEmitter.event()
					.name("progress")
					.data(progressEvent));
			} catch (IOException e) {
				log.error("Failed to send progress update to: {}", emitterKey, e);
				emitters.remove(emitterKey);
				emitter.completeWithError(e);
			}
		}
	}

	@Override
	public void completeProgress(String username, Long submissionId, SubmitStatus status) {
		String emitterKey = username + ":" + submissionId;
		SseEmitter emitter = emitters.get(emitterKey);
		
		if (emitter != null) {
			try {
				emitter.send(SseEmitter.event()
					.name("completed")
					.data(Map.of("finalStatus", status), MediaType.APPLICATION_JSON));
				emitter.complete();
			} catch (IOException e) {
				log.error("Failed to complete progress for: {}", emitterKey, e);
				emitter.completeWithError(e);
			} finally {
				emitters.remove(emitterKey);
			}
		}
	}
}
