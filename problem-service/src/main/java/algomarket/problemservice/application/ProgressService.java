package algomarket.problemservice.application;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.event.ProgressEvent;
import algomarket.problemservice.application.provided.ProgressStreamer;
import algomarket.problemservice.application.required.ProgressNotifier;
import algomarket.problemservice.application.required.ProgressSubscriber;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.submission.SubmitStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService implements ProgressStreamer {

	private final ProgressNotifier progressNotifier;
	private final ProgressSubscriber progressSubscriber;
	private final SubmissionRepository submissionRepository;

	@Override
	public SseEmitter subscribeSubmissionProgress(String username, Long submissionId) {
		validateSubmission(username, submissionId);

		SseEmitter emitter = progressNotifier.saveSubscription(username, submissionId);

		log.info("Starting subscription for submission: {}", submissionId);
		progressSubscriber.subscribeToProgress(submissionId);

		return emitter;
	}

	@EventListener
	private void handleProgressEvent(ProgressEvent event) {
		log.info("Processing progress event for submission {} (user: {}): {}", event.submissionId(), event.username(), event.submitStatus());
		
		progressNotifier.notifyProgressUpdate(event.username(), event.submissionId(), event);
		
		if (event.submitStatus().isCompleted()) {
			progressNotifier.completeProgress(event.username(), event.submissionId(), event.submitStatus());
			progressSubscriber.unsubscribeFromProgress(event.submissionId());
		}
	}

	private void validateSubmission(String username, Long submissionId) {
		if (!submissionRepository.existsByUsernameAndIdAndSubmitStatus(username, submissionId, SubmitStatus.JUDGING)) {
			throw new IllegalArgumentException("존재하지 않는 제출이거나, 이미 채점 완료 혹은 올바른 사용자의 제출이 아닙니다. SubmissionId: " + submissionId);
		}
	}
}
