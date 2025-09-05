package algomarket.problemservice.application.provided;

public interface OutboxRetryHandler {
	
	void retryPendingEvents();
}
