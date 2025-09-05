package algomarket.problemservice.application.required;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.domain.submission.SubmitStatus;

public interface ProgressNotifier {

	SseEmitter saveSubscription(String username, Long submissionId);
	
	void notifyProgressUpdate(String username, Long submissionId, ProgressEvent progressEvent);
	
	void completeProgress(String username, Long submissionId, SubmitStatus status);
}
