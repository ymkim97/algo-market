package algomarket.problemservice.application.provided;

import algomarket.problemservice.domain.problem.ProblemInfoResponse;

public interface ProblemFinder {

	ProblemInfoResponse find(Long problemId);
}
