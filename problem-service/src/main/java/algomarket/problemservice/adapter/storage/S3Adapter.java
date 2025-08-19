package algomarket.problemservice.adapter.storage;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import algomarket.problemservice.application.required.FileStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

	@Override
	public String createKeyForProblemUpload(Long problemId, String fileName) {
		String uuid = UUID.randomUUID().toString();
		FileCategory category = FileCategory.findByFileName(fileName);

		return category.createKey(problemId, uuid, fileName);
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
}
