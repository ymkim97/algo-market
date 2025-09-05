package algomarket.problemservice.adapter.messaging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.event.SubmittedEvent;
import algomarket.problemservice.application.provided.OutboxCleanupHandler;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SqsSubmissionEventProducer {

	@Value("${spring.cloud.aws.sqs.submission-request-queue}")
	private String queueName;

	private final SqsTemplate sqsTemplate;
	private final ObjectMapper objectMapper;
	private final OutboxCleanupHandler outboxCleanupHandler;

	@Async("threadPoolExecutor")
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void produce(SubmittedEvent submittedEvent) throws JsonProcessingException {
		String message = objectMapper.writeValueAsString(submittedEvent);

		sqsTemplate.send(to -> to
			.queue(queueName)
			.payload(message)
			.messageGroupId(submittedEvent.username())
			.messageDeduplicationId(submittedEvent.submissionId().toString())
		);

		outboxCleanupHandler.deleteSubmittedEvent(submittedEvent);
		log.info("Successfully sent SubmittedEvent to SQS and removed from outbox: {}", submittedEvent.submissionId());
	}

}
