package algomarket.problemservice.adapter.messaging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.event.SubmittedEvent;
import algomarket.problemservice.application.required.SubmissionEventHandler;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SqsSubmissionEventProducer implements SubmissionEventHandler {

	@Value("${spring.cloud.aws.sqs.submission-request-queue}")
	private String queueName;

	private final SqsTemplate sqsTemplate;
	private final ObjectMapper objectMapper;

	@Override
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
	public void produce(SubmittedEvent submittedEvent) {
		String message;

		try {
			message = objectMapper.writeValueAsString(submittedEvent);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Serialization failure", e);
		}

		sqsTemplate.send(to -> to
			.queue(queueName)
			.payload(message)
			.messageGroupId("submits")
			.messageDeduplicationId(submittedEvent.submissionId().toString())
		);
	}
}
