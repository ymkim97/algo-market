package algomarket.problemservice.application.dto;

public record InitiateUploadResponse(
	String key,

	String presignedUrl
) {
}
