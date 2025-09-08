package algomarket.problemservice.application;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.application.dto.SubmitResponse;
import algomarket.problemservice.application.event.JudgedEvent;
import algomarket.problemservice.application.event.SubmittedEvent;
import algomarket.problemservice.application.provided.SubmissionHandler;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionService implements SubmissionHandler {

	private final SubmissionRepository submissionRepository;
	private final ProblemRepository problemRepository;
	private final ApplicationEventPublisher eventPublisher;

	@Override
	@Transactional
	public SubmitResponse submit(SubmitRequest submitRequest, String username) {
		Problem problem = problemRepository.findById(submitRequest.problemId())
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제입니다: " + submitRequest.problemId()));

		problem.submit();

		Submission submission = Submission.submit(submitRequest, username);
		submission = submissionRepository.save(submission);

		SubmittedEvent submittedEvent = SubmittedEvent.of(submitRequest, username, submission.getId(), problem.getTimeLimitSec(), problem.getMemoryLimitMb());

		eventPublisher.publishEvent(submittedEvent);

		return SubmitResponse.from(submission);
	}

	@Override
	@Transactional
	public void finishSubmission(JudgedEvent judgedEvent) {
		Submission submission = submissionRepository.findById(judgedEvent.submissionId())
			.orElseThrow(() -> new NotFoundException("존재하지 않는 제출입니다: " + judgedEvent.submissionId()));

		submission.updateStatus(judgedEvent.submitStatus(), judgedEvent.runtimeMs(), judgedEvent.memoryKb());

		submissionRepository.save(submission);
	}
}
