package algomarket.problemservice.adapter.messaging;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.application.required.ProgressNotifier;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SseProgressAdapter implements ProgressNotifier {

	private static final Long DEFAULT_TIMEOUT_ONE_MIN = 60 * 1000L;
	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	@Override
	public SseEmitter saveSubscription(String username, Long submissionId) {
		String emitterKey = username + ":" + submissionId;
		SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_ONE_MIN);
		
		emitters.put(emitterKey, emitter);
		
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
	public void completeProgress(String username, Long submissionId, Object status) {
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
