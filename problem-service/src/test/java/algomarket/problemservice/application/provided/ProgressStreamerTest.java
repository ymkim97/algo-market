package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import algomarket.problemservice.application.ProgressService;
import algomarket.problemservice.application.required.ProgressNotifier;
import algomarket.problemservice.application.required.ProgressSubscriber;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.submission.SubmitStatus;

@ExtendWith(MockitoExtension.class)
class ProgressStreamerTest {

	@Mock
	ProgressNotifier progressNotifier;

	@Mock
	ProgressSubscriber progressSubscriber;

	@Mock
	SubmissionRepository submissionRepository;

	ProgressStreamer progressStreamer;

	@BeforeEach
	void setUp() {
		progressStreamer = new ProgressService(
			progressNotifier,
			progressSubscriber,
			submissionRepository
		);
	}

	@Test
	void subscribeSubmissionProgress_success() {
		// given
		String username = "testUser";
		Long submissionId = 1L;
		var expectedEmitter = new SseEmitter();

		given(submissionRepository.existsByUsernameAndIdAndSubmitStatus(username, submissionId, SubmitStatus.JUDGING))
			.willReturn(true);
		given(progressNotifier.saveSubscription(username, submissionId))
			.willReturn(expectedEmitter);

		// when
		var result = progressStreamer.subscribeSubmissionProgress(username, submissionId);

		// then
		assertThat(result).isEqualTo(expectedEmitter);

		verify(submissionRepository).existsByUsernameAndIdAndSubmitStatus(username, submissionId, SubmitStatus.JUDGING);
		verify(progressNotifier).saveSubscription(username, submissionId);
		verify(progressSubscriber).subscribeToProgress(submissionId);
	}

	@Test
	void subscribeSubmissionProgress_withInvalidSubmission_fail() {
		// given
		String username = "testUser";
		Long submissionId = 1L;

		given(submissionRepository.existsByUsernameAndIdAndSubmitStatus(username, submissionId, SubmitStatus.JUDGING))
			.willReturn(false);

		// when & then
		assertThatThrownBy(() -> progressStreamer.subscribeSubmissionProgress(username, submissionId))
			.isInstanceOf(IllegalArgumentException.class);

		verify(progressNotifier, never()).saveSubscription(any(), any());
		verify(progressSubscriber, never()).subscribeToProgress(any());
	}

}
