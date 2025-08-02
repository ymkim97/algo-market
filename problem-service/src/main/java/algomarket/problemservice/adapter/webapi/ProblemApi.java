package algomarket.problemservice.adapter.webapi;

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
	public ProblemInfoResponse find(@PathVariable Long problemId) {
		return problemFinder.find(problemId);
	}

	@PostMapping
	public ProblemInfoResponse create(@Valid @RequestBody ProblemCreateRequest request) {
		return problemCreator.create(request);
	}
}
