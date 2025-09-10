package algomarket.problemservice.application.provided;

import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;

public interface ProblemCreator {

	ProblemInfoResponse create(ProblemCreateRequest request, String username);
}
