package algomarket.problemservice.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.domain.problem.DuplicateTitleException;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemModifyService implements ProblemCreator {

	private final ProblemRepository problemRepository;

	@Override
	@Transactional
	public ProblemInfoResponse create(ProblemCreateRequest createRequest) {
		checkDuplicateTitle(createRequest.title());

		Problem problem = Problem.create(createRequest);

		return ProblemInfoResponse.of(problemRepository.save(problem));
	}

	private void checkDuplicateTitle(String title) {
		if (problemRepository.existsByTitle(title)) {
			throw new DuplicateTitleException("이미 존재하는 제목입니다: " + title);
		}
	}
}
