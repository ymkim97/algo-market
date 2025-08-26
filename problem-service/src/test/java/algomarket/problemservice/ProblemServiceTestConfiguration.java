package algomarket.problemservice;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import algomarket.problemservice.application.required.SubmissionEventHandler;

@TestConfiguration
public class ProblemServiceTestConfiguration {

	@Bean
	public SubmissionEventHandler submissionEventHandler() {
		return submittedEvent -> {};
	}
}
