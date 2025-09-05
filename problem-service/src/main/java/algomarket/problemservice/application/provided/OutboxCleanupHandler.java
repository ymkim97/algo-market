package algomarket.problemservice.application.provided;

import algomarket.problemservice.application.event.SubmittedEvent;

public interface OutboxCleanupHandler {

	void deleteSubmittedEvent(SubmittedEvent submittedEvent);
}
