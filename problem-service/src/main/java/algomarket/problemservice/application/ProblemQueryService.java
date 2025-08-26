package algomarket.problemservice.application;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.InitiateUploadRequest;
import algomarket.problemservice.application.dto.InitiateUploadResponse;
import algomarket.problemservice.application.provided.ProblemFileManager;
import algomarket.problemservice.application.required.FileStorage;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.application.provided.ProblemFinder;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.domain.problem.Problem;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemQueryService implements ProblemFinder, ProblemFileManager {

	private final ProblemRepository problemRepository;
	private final FileStorage fileStorage;

	@Override
	public ProblemInfoResponse find(Long problemId) {
		Problem problem = problemRepository.findById(problemId)
			.orElseThrow(() -> new NotFoundException("존재하지 않는 문제 번호입니다."));

		return ProblemInfoResponse.from(problem);
	}

	@Override
	public InitiateUploadResponse initiateUpload(InitiateUploadRequest request) {
		validateProblemId(request.problemId());

		String key = fileStorage.createKeyForProblemUpload(request.problemId(), request.originalFileName());

		Map<String, String> metadata = new HashMap<>();
		metadata.put("originalFileName", request.originalFileName());
		metadata.put("fileSizeKiloBytes", String.valueOf(request.fileSizeKiloBytes()));
		metadata.put("problemId", String.valueOf(request.problemId()));

		String presignedUrl = fileStorage.createPresignedUrl(key, metadata);

		return new InitiateUploadResponse(key, presignedUrl);
	}

	private void validateProblemId(Long problemId) {
		if (!problemRepository.existsById(problemId)) {
			throw new NotFoundException("존재하지 않는 문제 번호입니다: " + problemId);
		}
	}
}
