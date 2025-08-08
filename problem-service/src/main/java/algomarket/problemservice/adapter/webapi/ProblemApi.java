package algomarket.problemservice.adapter.webapi;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import algomarket.problemservice.application.dto.ProblemInfoResponse;
import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.provided.ProblemFinder;
import algomarket.problemservice.domain.problem.ProblemCreateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * TODO: 테스트 데이터, 이미지 업로드: S3 presigned url, 이미지 다운로드: CDN(CloudFront)
 */

@RestController
@RequestMapping("/problems")
@RequiredArgsConstructor
public class ProblemApi {

	private final ProblemFinder problemFinder;
	private final ProblemCreator problemCreator;

	@GetMapping("/{problemId}")
	public ResponseEntity<ProblemInfoResponse> find(@PathVariable Long problemId) {
		ProblemInfoResponse response = problemFinder.find(problemId);

		return ResponseEntity.ok()
			.body(response);
	}

	@PostMapping
	public ResponseEntity<ProblemInfoResponse> create(@RequestBody @Valid ProblemCreateRequest request) {
		ProblemInfoResponse response = problemCreator.create(request);

		return ResponseEntity.created(URI.create("/problems/" + response.problemId()))
			.body(response);
	}
}
