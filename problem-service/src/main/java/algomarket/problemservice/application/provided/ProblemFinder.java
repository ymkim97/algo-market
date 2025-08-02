package algomarket.problemservice.application.provided;

import algomarket.problemservice.application.dto.ProblemInfoResponse;

public interface ProblemFinder {

	ProblemInfoResponse find(Long problemId);
}
