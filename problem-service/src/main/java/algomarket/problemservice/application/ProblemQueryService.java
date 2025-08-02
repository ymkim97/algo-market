package algomarket.problemservice.application;

import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.ProblemInfoResponse;
import algomarket.problemservice.application.provided.ProblemFinder;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.domain.problem.Problem;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemQueryService implements ProblemFinder {

	private final ProblemRepository problemRepository;

	@Override
	public ProblemInfoResponse find(Long problemId) {
		Problem problem = problemRepository.findById(problemId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문제 번호입니다."));

		return ProblemInfoResponse.of(problem);
	}
}
