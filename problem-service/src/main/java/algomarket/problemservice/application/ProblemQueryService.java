package algomarket.problemservice.application;

import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.InitiateUploadRequest;
import algomarket.problemservice.application.dto.InitiateUploadResponse;
import algomarket.problemservice.application.dto.MyProblemInfoResponse;
import algomarket.problemservice.application.dto.ProblemListResponse;
import algomarket.problemservice.application.provided.ProblemFileManager;
import algomarket.problemservice.application.provided.ProblemFinder;
import algomarket.problemservice.application.required.FileStorage;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemQueryService implements ProblemFinder, ProblemFileManager {

	private final int PAGE_SIZE = 10;

	private final ProblemRepository problemRepository;
	private final FileStorage fileStorage;

	@Override
	public ProblemInfoResponse find(Long problemNumber) {
		Problem problem = problemRepository.findByNumber(problemNumber)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제 번호입니다 - Number:" + problemNumber));

		return ProblemInfoResponse.from(problem);
	}

	@Override
	public Page<ProblemListResponse> listProblems(Integer pageNumber) {
		return problemRepository.findAll(PageRequest.of(pageNumber, PAGE_SIZE, Sort.by(Sort.Direction.ASC, "number")));
	}

	@Override
	public MyProblemInfoResponse findMyProblem(Long problemId, String username) {
		Problem problem = problemRepository.findByIdAndAuthorUsername(problemId, username)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제 임시 저장입니다 - ID:" + problemId));

		return MyProblemInfoResponse.from(problem);
	}

	@Override
	public Page<MyProblemInfoResponse> listMyProblems(Integer pageNumber, String username) {
		return problemRepository.findAllMyProblems(PageRequest.of(pageNumber, PAGE_SIZE, Sort.by(Sort.Direction.ASC, "number")), username);
	}

	@Override
	public InitiateUploadResponse initiateUpload(InitiateUploadRequest request, String username) {
		validateProblem(request.problemId(), username);

		String key = fileStorage.createKeyForProblemUpload(request.problemId(), request.originalFileName());

		Map<String, String> metadata = new HashMap<>();
		metadata.put("originalFileName", request.originalFileName());
		metadata.put("fileSizeKiloBytes", String.valueOf(request.fileSizeKiloBytes()));
		metadata.put("problemId", String.valueOf(request.problemId()));

		String presignedUrl = fileStorage.createPresignedUrl(key, metadata);

		return new InitiateUploadResponse(key, presignedUrl);
	}

	private void validateProblem(Long problemId, String username) {
		if (!problemRepository.existsByIdAndAuthorUsername(problemId, username)) {
			throw new NotFoundException("존재하지 않는 문제 ID 입니다: " + problemId);
		}
	}
}
