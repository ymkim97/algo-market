package algomarket.problemservice.application;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.event.SubmittedEvent;
import algomarket.problemservice.application.provided.OutboxCleanupHandler;
import algomarket.problemservice.application.provided.OutboxRetryHandler;
import algomarket.problemservice.application.required.OutboxRepository;
import algomarket.problemservice.domain.outbox.Outbox;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxService implements OutboxRetryHandler, OutboxCleanupHandler {

	private final OutboxRepository outboxRepository;
	private final ApplicationEventPublisher eventPublisher;
	private final ObjectMapper objectMapper;

	@Override
	@Transactional
	public void retryPendingEvents() {
		int retryThresholdMinutes = 1;
		LocalDateTime threshold = LocalDateTime.now().minusMinutes(retryThresholdMinutes);
		
		List<Outbox> publishFailedMessages = outboxRepository.findTop100ByTimeStampBeforeOrderByTimeStampAsc(threshold);

		if (publishFailedMessages.isEmpty()) {
			return;
		}

		log.info("Found {} publish failed outbox messages older than {} minutes", publishFailedMessages.size(), retryThresholdMinutes);

		for (Outbox message : publishFailedMessages) {
			try {
				retryMessage(message);
			} catch (Exception e) {
				log.error("Failed to retry outbox message: {}", message.getId(), e);
			}
		}
	}

	@Override
	@Transactional
	public void deleteSubmittedEvent(SubmittedEvent submittedEvent) {
		outboxRepository.deleteByAggregateId(submittedEvent.submissionId());
		log.debug("Removed outbox message for submission: {}", submittedEvent.submissionId());
	}

	@TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
	protected void saveSubmittedEvent(SubmittedEvent submittedEvent) {
		if (outboxRepository.existsByAggregateId(submittedEvent.submissionId())) {
			return;
		}

		Outbox outbox = Outbox.create(submittedEvent.submissionId(), "Submission", submittedEvent, objectMapper);
		Outbox savedOutBox = outboxRepository.save(outbox);

		log.info("SubmittedEvent saved to outbox with eventId: {}", savedOutBox.getId());
	}

	private void retryMessage(Outbox message) throws JsonProcessingException {
		SubmittedEvent submittedEvent = objectMapper.readValue(message.getPayload(), SubmittedEvent.class);

		log.info("Retrying SubmittedEvent: submissionId={}, eventId={}", submittedEvent.submissionId(), message.getId());
		eventPublisher.publishEvent(submittedEvent);
	}
}
