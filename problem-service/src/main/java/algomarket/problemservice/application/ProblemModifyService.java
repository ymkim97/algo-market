package algomarket.problemservice.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.adapter.lock.DistributedLock;
import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.provided.ProblemRemover;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.DuplicateTitleException;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemDraftModifyRequest;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.domain.service.ProblemPublisher;
import algomarket.problemservice.domain.submission.Submission;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemModifyService implements ProblemCreator, ProblemRemover {

	private final ProblemRepository problemRepository;
	private final SubmissionRepository submissionRepository;
	private final ProblemPublisher problemPublisher = new ProblemPublisher();

	@Override
	@Transactional
	public ProblemInfoResponse create(ProblemCreateRequest createRequest, String username) {
		checkDuplicateTitle(createRequest.title(), null);

		Problem problem = Problem.create(createRequest, username);

		return ProblemInfoResponse.from(problemRepository.save(problem));
	}

	@Override
	@Transactional
	public ProblemInfoResponse saveDraftChanges(ProblemDraftModifyRequest draftModifyRequest, String username) {
		checkDuplicateTitle(draftModifyRequest.title(), draftModifyRequest.problemId());

		Problem problem = problemRepository.findByIdAndAuthorUsername(draftModifyRequest.problemId(), username)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제입니다. - ID: " + draftModifyRequest.problemId()));

		List<Submission> submissions = submissionRepository.findAllByProblemIdAndUsername(draftModifyRequest.problemId(), username);
		submissions.forEach(submission -> submission.updateProblemTitle(draftModifyRequest.title()));

		problem.modifyDraft(draftModifyRequest);

		submissionRepository.saveAll(submissions);

		return ProblemInfoResponse.from(problemRepository.save(problem));
	}

	@Override
	@DistributedLock(key = "'makePublic'", waitTime = 10, leaseTime = 5)
	public void makePublic(Long problemId, String username) {
		Problem problem = problemRepository.findByIdAndAuthorUsername(problemId, username)
			.orElseThrow(() -> new NotFoundException("문제 제작자의 문제가 존재하지 않습니다 - ID:" + problemId));

		Long maxProblemNumber = problemRepository.findMaxProblemNumber();

		List<Submission> submissions = submissionRepository.findAllByProblemIdAndUsername(problemId, username);
		
		problemPublisher.publish(username, problem, submissions, maxProblemNumber);
		problemRepository.save(problem);
	}

	@Override
	@Transactional
	public void removeDraft(Long problemId, String username) {
		problemRepository.deleteDraftProblem(problemId, username);
	}

	private void checkDuplicateTitle(String title, Long problemIdNotToContain) {
		if (title != null && problemRepository.existsByTitleAndIdNot(title, problemIdNotToContain)) {
			throw new DuplicateTitleException("이미 존재하는 제목입니다: " + title);
		}
	}
}
