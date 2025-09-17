package algomarket.problemservice.application;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import algomarket.problemservice.application.dto.InitiateUploadRequest;
import algomarket.problemservice.application.dto.InitiateUploadResponse;
import algomarket.problemservice.application.provided.ProblemFileManager;
import algomarket.problemservice.application.required.FileStorage;
import algomarket.problemservice.application.required.ProblemRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemFileStorageService implements ProblemFileManager {

	private final FileStorage fileStorage;
	private final ProblemRepository problemRepository;

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

	@Override
	public void deleteAllProblemFiles(Long problemId, String username) {
		validateProblem(problemId, username);

		fileStorage.deleteAllProblemFiles(problemId);
	}

	private void validateProblem(Long problemId, String username) {
		if (!problemRepository.existsByIdAndAuthorUsername(problemId, username)) {
			throw new NotFoundException("존재하지 않는 문제 ID 입니다: " + problemId);
		}
	}
}
