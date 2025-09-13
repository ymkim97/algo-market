package algomarket.problemservice.application.provided;

import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.domain.problem.ProblemDraftModifyRequest;

public interface ProblemCreator {

	ProblemInfoResponse create(ProblemCreateRequest createRequest, String username);

	ProblemInfoResponse saveDraftChanges(ProblemDraftModifyRequest modifyDraftRequest, String username);

	void makePublic(Long problemId, String username);
}
