package algomarket.problemservice.adapter.messaging;

import org.springframework.stereotype.Component;

import algomarket.problemservice.application.event.JudgedEvent;
import algomarket.problemservice.application.provided.SubmissionHandler;
import io.awspring.cloud.sqs.annotation.SqsListener;
import io.awspring.cloud.sqs.listener.acknowledgement.Acknowledgement;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SqsSubmissionEventConsumer {

	private final SubmissionHandler submissionHandler;

	@SqsListener(value = "${spring.cloud.aws.sqs.submission-result-queue}", factory = "defaultSqsListenerContainerFactory", acknowledgementMode = "MANUAL")
	public void consume(JudgedEvent judgedEvent, Acknowledgement acknowledgement) {
		submissionHandler.finishSubmission(judgedEvent);
		acknowledgement.acknowledge();
	}
}
