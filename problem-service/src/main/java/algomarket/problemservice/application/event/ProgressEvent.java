package algomarket.problemservice.application.event;

import java.time.LocalDateTime;

import algomarket.problemservice.domain.submission.SubmitStatus;

public record ProgressEvent(
	Long submissionId,
	String username,
	SubmitStatus submitStatus,
	Integer progressPercent,
	Integer currentTest,
	Integer totalTest,
	LocalDateTime timeStamp,
	Integer runtimeMs,
	Integer memoryKb
) {

}
