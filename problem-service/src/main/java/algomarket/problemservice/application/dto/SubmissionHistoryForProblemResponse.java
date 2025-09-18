package algomarket.problemservice.application.dto;

import java.time.LocalDateTime;

import algomarket.problemservice.domain.shared.Language;
import algomarket.problemservice.domain.submission.SubmitStatus;

public record SubmissionHistoryForProblemResponse(
	Long submissionId,

	Long problemId,

	String username,

	SubmitStatus submitStatus,

	String sourceCode,

	Language language,

	Integer runtimeMs,

	Integer memoryKb,

	LocalDateTime submitTime,

	String problemTitle
) {

}
