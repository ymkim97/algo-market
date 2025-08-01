package algomarket.problemservice.application.provided;

import algomarket.problemservice.application.dto.ProblemInfoResponse;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;

public interface ProblemCreator {

	ProblemInfoResponse create(ProblemCreateRequest request);
}
