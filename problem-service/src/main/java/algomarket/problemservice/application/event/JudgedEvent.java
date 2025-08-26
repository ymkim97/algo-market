package algomarket.problemservice.application.event;

import algomarket.problemservice.domain.submission.SubmitStatus;

public record JudgedEvent(
	Long submissionId,
	Long problemId,
	String username,
	SubmitStatus submitStatus,
	Integer runtimeMs,
	Integer memoryKb
) {
}
