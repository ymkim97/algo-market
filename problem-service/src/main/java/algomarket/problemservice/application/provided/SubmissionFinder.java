package algomarket.problemservice.application.provided;

import org.springframework.data.domain.Page;

import algomarket.problemservice.application.dto.SubmissionHistoryForProblemResponse;

public interface SubmissionFinder {

	Page<SubmissionHistoryForProblemResponse> findSubmittedForProblem(Integer pageNumber, Integer pageSize, Long problemId, String username);

	Page<SubmissionHistoryForProblemResponse> findAll(Integer pageNumber, Integer pageSize, String username);
}
