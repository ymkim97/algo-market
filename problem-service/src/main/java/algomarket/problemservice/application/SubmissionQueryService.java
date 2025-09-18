package algomarket.problemservice.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.SubmissionHistoryForProblemResponse;
import algomarket.problemservice.application.provided.SubmissionFinder;
import algomarket.problemservice.application.required.SubmissionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionQueryService implements SubmissionFinder {

	private final SubmissionRepository submissionRepository;

	@Override
	public Page<SubmissionHistoryForProblemResponse> findSubmittedForProblem(Integer pageNumber, Integer pageSize, Long problemId, String username) {
		return submissionRepository.findHistoryForProblem(
			PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "submitTime")), problemId, username);
	}
}
