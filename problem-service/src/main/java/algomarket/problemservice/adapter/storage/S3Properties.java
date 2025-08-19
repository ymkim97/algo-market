package algomarket.problemservice.adapter.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spring.cloud.aws.s3")
public record S3Properties(
	String bucketName,
	long presignedExpireMinutes
) {
}
