package algomarket.problemservice;

import java.util.Map;
import java.util.UUID;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import algomarket.problemservice.adapter.storage.FileCategory;
import algomarket.problemservice.application.required.FileStorage;

@TestConfiguration
public class ProblemServiceTestConfiguration {

	@Bean
	public FileStorage fileStorage() {
		return new FileStorage() {
			@Override
			public String createKeyForProblemUpload(Long problemId, String fileName) {
				String uuid = UUID.randomUUID().toString();
				FileCategory category = FileCategory.findByFileName(fileName);

				return category.createKey(problemId, uuid, fileName);
			}

			@Override
			public String createPresignedUrl(String key, Map<String, String> metadata) {
				return "presignedUrl-created";
			}
		};
	}
}
