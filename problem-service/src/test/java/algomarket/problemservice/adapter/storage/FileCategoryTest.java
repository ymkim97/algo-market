package algomarket.problemservice.adapter.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class FileCategoryTest {

	@ParameterizedTest
	@CsvSource({"image_for_upload.jpg", "PHOTO.JPEG", "icon.PnG", "hello.aa.svg"})
	void findByFileName_withImage(String fileName) {
		var fileCategory = FileCategory.findByFileName(fileName);

		assertThat(fileCategory).isEqualTo(FileCategory.IMAGE);
	}

	@ParameterizedTest
	@CsvSource({"input.in", "ans.out"})
	void findByFileName_withTestData(String fileName) {
		var fileCategory = FileCategory.findByFileName(fileName);

		assertThat(fileCategory).isEqualTo(FileCategory.TEST_DATA);
	}

	@ParameterizedTest
	@CsvSource(value = {"image_for_upload.mp4", "abc", "file.", "abc.b.c"})
	void getExtensionFrom_withNotSupportedExt_fail(String fileName) {
		assertThatThrownBy(() -> FileCategory.findByFileName(fileName))
		    .isInstanceOf(UnsupportedFileExtensionException.class);
	}

	@Test
	void getExtensionFrom_withEmptyFileName_fail() {
		assertThatThrownBy(() -> FileCategory.findByFileName(""))
		    .isInstanceOf(UnsupportedFileExtensionException.class);
	}
}
