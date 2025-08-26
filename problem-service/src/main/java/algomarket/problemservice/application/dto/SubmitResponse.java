package algomarket.problemservice.application.dto;

import java.time.LocalDateTime;

import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitStatus;

public record SubmitResponse(
	Long submissionId,
	Long problemId,
	String username,
	SubmitStatus submitStatus,
	Integer runtimeMs,
	Integer memoryKb,
	LocalDateTime submitTime
) {

	public static SubmitResponse from(Submission submission) {
		return new SubmitResponse(
			submission.getId(),
			submission.getProblemId(),
			submission.getUsername(),
			submission.getSubmitStatus(),
			submission.getRuntimeMs(),
			submission.getMemoryKb(),
			submission.getSubmitTime()
		);
	}
}
