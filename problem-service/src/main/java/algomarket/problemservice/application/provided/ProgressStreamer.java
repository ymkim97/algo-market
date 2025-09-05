package algomarket.problemservice.application.provided;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface ProgressStreamer {

	SseEmitter subscribeSubmissionProgress(String username, Long submissionId);
}
