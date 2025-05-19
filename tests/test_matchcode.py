#
# Copyright (c) nexB Inc. and others. All rights reserved.
# purldb is a trademark of nexB Inc.
# SPDX-License-Identifier: Apache-2.0
# See http://www.apache.org/licenses/LICENSE-2.0 for the license text.
# See https://github.com/aboutcode-org/matchcode-tests for support or download.
# See https://aboutcode.org for more information about nexB OSS projects.
#

import os
from collections import defaultdict

from commoncode.fileutils import delete
from commoncode.testcase import FileBasedTesting
from commoncode.testcase import check_against_expected_json_file

from matchcode_toolkit.fingerprinting import get_file_fingerprint_hashes
from matchcode_toolkit.fingerprinting import split_fingerprint
from matchcode_toolkit.halohash import byte_hamming_distance


class TestMatchcode(FileBasedTesting):
    test_data_dir = os.path.join(os.path.dirname(__file__), "data")

    def setUp(self):
        super().setUp()
        data_zip_loc = self.get_test_loc("data.zip")
        self.test_data_loc = self.extract_test_zip(data_zip_loc)

    def tearDown(self):
        super().tearDown()
        delete(self.test_data_loc)

    def _test_snippets_similarity_ai_gen_code(self, problem, regen=False):
        def create_snippet_mappings_by_snippets(snippets):
            snippet_mappings_by_snippet = defaultdict(list)
            for s in snippets:
                snippet = s["snippet"]
                snippet_mappings_by_snippet[snippet].append(s)
            return snippet_mappings_by_snippet

        temps = [0, 0.5, 1]
        llms = ["gpt4", "gpt_3.5_turbo"]
        code_gen_types = ["cppToJava", "java", "java_regular", "pythonToJava"]
        solution_loc = f"{self.test_data_loc}/data/{problem}/Solution.java"
        solution_loc = self.get_test_loc(solution_loc)
        solution_results = get_file_fingerprint_hashes(solution_loc, include_ngrams=True)
        solution_halo1 = solution_results.get("halo1")
        solution_snippets = solution_results.get("snippets")
        _, solution_fingerprint_hash = split_fingerprint(solution_halo1)
        solution_snippet_mappings_by_snippets = create_snippet_mappings_by_snippets(
            solution_snippets
        )

        results = []
        for temp in temps:
            for llm in llms:
                for code_gen_type in code_gen_types:
                    for i in range(1, 21):
                        test_file_loc = (
                            f"{self.test_data_loc}/data/{problem}/{temp}/{llm}/{code_gen_type}/"
                            f"repeated/llm_generated/generated_{i}.java"
                        )
                        gen_solution = self.get_test_loc(test_file_loc)
                        gen_results = get_file_fingerprint_hashes(gen_solution, include_ngrams=True)
                        gen_halo1 = gen_results.get("halo1")
                        gen_snippets = gen_results.get("snippets")

                        _, gen_fingerprint_hash = split_fingerprint(gen_halo1)
                        gen_snippet_mappings_by_snippets = create_snippet_mappings_by_snippets(
                            gen_snippets
                        )

                        distance = byte_hamming_distance(
                            solution_fingerprint_hash, gen_fingerprint_hash
                        )
                        snippet_results = (
                            solution_snippet_mappings_by_snippets.keys()
                            & gen_snippet_mappings_by_snippets.keys()
                        )
                        snippets_matched_to_solution = [
                            solution_snippet_mappings_by_snippets[snippet]
                            for snippet in snippet_results
                        ]
                        snippets_matched_to_gen = [
                            gen_snippet_mappings_by_snippets[snippet] for snippet in snippet_results
                        ]

                        results.append(
                            {
                                test_file_loc: {
                                    "distance": distance,
                                    "snippets_matched_to_solution": snippets_matched_to_solution,
                                    "snippets_matched_to_gen": snippets_matched_to_gen,
                                }
                            }
                        )

        expected_results_loc = self.get_test_loc(
            f"{problem}-expected.json"
        )
        check_against_expected_json_file(results, expected_results_loc, regen=regen)

    def test_snippets_similarity_ai_gen_code_bob_alice_flower(self):
        self._test_snippets_similarity_ai_gen_code("bob_alice_flower", regen=False)

    def test_snippets_similarity_ai_gen_code_find_equalindromic(self):
        self._test_snippets_similarity_ai_gen_code("find_equalindromic", regen=False)

    def test_snippets_similarity_ai_gen_code_find_indices(self):
        self._test_snippets_similarity_ai_gen_code("find_indices", regen=False)

    def test_snippets_similarity_ai_gen_code_find_polygon(self):
        self._test_snippets_similarity_ai_gen_code("find_polygon", regen=False)

    def test_snippets_similarity_ai_gen_code_max_num_elements_subsets(self):
        self._test_snippets_similarity_ai_gen_code("max_num_elements_subsets", regen=False)

    def test_snippets_similarity_ai_gen_code_max_num_ops(self):
        self._test_snippets_similarity_ai_gen_code("max_num_ops", regen=False)

    def test_snippets_similarity_ai_gen_code_max_set_removals(self):
        self._test_snippets_similarity_ai_gen_code("max_set_removals", regen=False)

    def test_snippets_similarity_ai_gen_code_min_len_ops(self):
        self._test_snippets_similarity_ai_gen_code("min_len_ops", regen=False)

    def test_snippets_similarity_ai_gen_code_min_moves_queen(self):
        self._test_snippets_similarity_ai_gen_code("min_moves_queen", regen=False)

    def test_snippets_similarity_ai_gen_code_min_time_revert(self):
        self._test_snippets_similarity_ai_gen_code("min_time_revert", regen=False)
