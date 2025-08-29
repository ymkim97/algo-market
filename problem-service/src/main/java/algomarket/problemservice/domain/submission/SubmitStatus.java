package algomarket.problemservice.domain.submission;

public enum SubmitStatus {
	JUDGING,
	ACCEPTED,
	WRONG_ANSWER,
	COMPILE_ERROR,
	RUNTIME_ERROR,
	SERVER_ERROR,
	MEMORY_LIMIT_EXCEEDED,
	TIME_LIMIT_EXCEEDED,
}
