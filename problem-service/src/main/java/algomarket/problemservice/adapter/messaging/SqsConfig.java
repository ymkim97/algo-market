package algomarket.problemservice.adapter.messaging;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.awspring.cloud.sqs.config.SqsMessageListenerContainerFactory;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsAsyncClient;

@Configuration
public class SqsConfig {

	@Value("${spring.cloud.aws.region.static}")
	private String region;

	@Bean
	public SqsAsyncClient sqsAsyncClient(AwsCredentialsProvider awsCredentialsProvider) {
		return SqsAsyncClient.builder()
			.credentialsProvider(awsCredentialsProvider)
			.region(Region.of(region))
			.build();
	}

	@Bean
	public SqsTemplate sqsTemplate(SqsAsyncClient sqsAsyncClient) {
		return SqsTemplate.newTemplate(sqsAsyncClient);
	}

	@Bean
	public SqsMessageListenerContainerFactory<Object> defaultSqsListenerContainerFactory(SqsAsyncClient sqsAsyncClient) {
		return SqsMessageListenerContainerFactory.builder()
			.configure(sqsContainerOptionsBuilder ->
				sqsContainerOptionsBuilder
					.maxConcurrentMessages(10) // 컨테이너의 스레드 풀 크기
					.maxMessagesPerPoll(10) // 한 번의 폴링 요청으로 수신할 수 있는 최대 메시지 수 지정
					.pollTimeout(Duration.ofSeconds(10)) // 롱 폴링 대기 시간(WaitTimeSeconds)
					.acknowledgementInterval(Duration.ofSeconds(1))
					.acknowledgementThreshold(1)
			)
			.sqsAsyncClient(sqsAsyncClient)
			.build();
	}
}
