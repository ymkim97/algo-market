package algomarket.problemservice.domain.problem;

import java.util.ArrayList;
import java.util.List;

import algomarket.problemservice.application.dto.InitiateUploadRequest;

public class ProblemFixture {

	public static ProblemCreateRequest createProblemCreateRequest() {
		return createProblemCreateRequest(1.0, 512);
	}

	public static ProblemCreateRequest createProblemCreateRequest(Double timeLimit, Integer memoryLimit) {
		return createProblemCreateRequest("Title", timeLimit, memoryLimit);
	}

	public static ProblemCreateRequest createProblemCreateRequest(String title, Double timeLimit, Integer memoryLimit) {
		List<TestCaseUrl> testCaseUrls = new ArrayList<>();

		for (int i = 0; i < 10; i++) {
			testCaseUrls.add(new TestCaseUrl("in", "out"));
		}
		return new ProblemCreateRequest(title, "Description", timeLimit, memoryLimit, null, testCaseUrls);
	}

	public static InitiateUploadRequest createInitiateUploadRequest(Long problemId) {
		return createInitiateUploadRequest("fileName.jpg", problemId);
	}

	public static InitiateUploadRequest createInitiateUploadRequest(String fileName, Long problemId) {
		return new InitiateUploadRequest(fileName, 12345, problemId);
	}
}
