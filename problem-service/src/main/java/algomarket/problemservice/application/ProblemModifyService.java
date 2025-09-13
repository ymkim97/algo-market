package algomarket.problemservice.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.adapter.lock.DistributedLock;
import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.DuplicateTitleException;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.domain.service.ProblemPublisher;
import algomarket.problemservice.domain.submission.Submission;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemModifyService implements ProblemCreator {

	private final ProblemRepository problemRepository;
	private final SubmissionRepository submissionRepository;
	private final ProblemPublisher problemPublisher = new ProblemPublisher();

	@Override
	@Transactional
	public ProblemInfoResponse create(ProblemCreateRequest createRequest, String username) {
		checkDuplicateTitle(createRequest.title());

		Problem problem = Problem.create(createRequest, username);

		return ProblemInfoResponse.from(problemRepository.save(problem));
	}

	@Override
	public void saveDraftChanges(String username) {
		// TODO: 임시저장
	}

	@Override
	@DistributedLock(key = "'makePublic'")
	public void makePublic(Long problemId, String username) {
		Problem problem = problemRepository.findByIdAndAuthorUsername(problemId, username)
			.orElseThrow(() -> new NotFoundException("문제 제작자의 문제가 존재하지 않습니다 - ID:" + problemId));

		Long maxProblemNumber = problemRepository.findMaxProblemNumber();

		List<Submission> submissions = submissionRepository.findAllByProblemIdAndUsername(problemId, username);
		
		problemPublisher.publish(username, problem, submissions, maxProblemNumber);
		problemRepository.save(problem);
	}

	private void checkDuplicateTitle(String title) {
		if (problemRepository.existsByTitle(title)) {
			throw new DuplicateTitleException("이미 존재하는 제목입니다: " + title);
		}
	}
}
