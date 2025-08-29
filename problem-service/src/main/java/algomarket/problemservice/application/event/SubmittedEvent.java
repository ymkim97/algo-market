package algomarket.problemservice.application.event;

import algomarket.problemservice.domain.submission.Language;
import algomarket.problemservice.domain.submission.SubmitRequest;

public record SubmittedEvent(
	Long submissionId,
	Long problemId,
	String username,
	String sourceCode,
	Language language,
	Double timeLimitSec,
	Integer memoryLimitMb
) {
	public static SubmittedEvent of(SubmitRequest submitRequest, String username, Long submissionId, Double timeLimit, Integer memoryLimit) {
		return new SubmittedEvent(
			submissionId,
			submitRequest.problemId(),
			username,
			submitRequest.sourceCode(),
			submitRequest.language(),
			timeLimit,
			memoryLimit
		);
	}
}
