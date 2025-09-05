package algomarket.problemservice.adapter.messaging;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import algomarket.problemservice.application.provided.OutboxRetryHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxRetryScheduler {

	private final OutboxRetryHandler outboxRetryHandler;

	@Scheduled(fixedDelayString = "${outbox.retry.interval-ms}", initialDelay = 10_000)
	public void retryPendingEvents() {
		log.debug("Starting outbox retry job");

		outboxRetryHandler.retryPendingEvents();
	}
}
