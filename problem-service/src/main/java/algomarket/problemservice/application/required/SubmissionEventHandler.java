package algomarket.problemservice.application.required;

import algomarket.problemservice.application.event.SubmittedEvent;

public interface SubmissionEventHandler {

	void produce(SubmittedEvent submittedEvent);
}
