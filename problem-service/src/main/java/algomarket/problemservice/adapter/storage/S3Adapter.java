package algomarket.problemservice.adapter.storage;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import algomarket.problemservice.application.required.FileStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Component
@Slf4j
@RequiredArgsConstructor
public class S3Adapter implements FileStorage {

	private final S3Presigner s3Presigner;
	private final S3Properties s3Properties;
	private final S3Client s3Client;

	@Override
	public String createKeyForProblemUpload(Long problemId, String fileName) {
		FileCategory category = FileCategory.findByFileName(fileName);

		return category.createKey(problemId, fileName);
	}

	@Override
	public String createPresignedUrl(String key, Map<String, String> metadata) {
		PutObjectRequest objectRequest = PutObjectRequest.builder()
			.bucket(s3Properties.bucketName())
			.key(key)
			.metadata(metadata)
			.build();

		PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
			.signatureDuration(Duration.ofMinutes(s3Properties.presignedExpireMinutes()))
			.putObjectRequest(objectRequest)
			.build();

		PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

		log.debug("Generated S3 presign for key=[{}], expiresInMinutes=[{}]", key, s3Properties.presignedExpireMinutes());

		return presignedRequest.url().toExternalForm();
	}

	@Override
	public void deleteAllProblemFiles(Long problemId) {
		String prefix = "problems/" + problemId + "/";

		// 1. 해당 prefix의 모든 객체 조회
		ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
			.bucket(s3Properties.bucketName())
			.prefix(prefix)
			.build();

		ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

		// 2. 객체가 있으면 삭제
		if (!listResponse.contents().isEmpty()) {
			List<ObjectIdentifier> objectsToDelete = listResponse.contents().stream()
				.map(s3Object -> ObjectIdentifier.builder()
					.key(s3Object.key())
					.build())
				.toList();

			DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
				.bucket(s3Properties.bucketName())
				.delete(Delete.builder()
					.objects(objectsToDelete)
					.build())
				.build();

			s3Client.deleteObjects(deleteRequest);

			log.debug("Deleted {} objects with prefix=[{}]", objectsToDelete.size(), prefix);
		}
	}
}
