import { createSlice } from "@reduxjs/toolkit";

export type ModelStatus = "idle" | "loading" | "ready" | "error";

interface ImageClassifierState {
  status: ModelStatus;
}

const initialState: ImageClassifierState = { status: "idle" };

const imageClassifierSlice = createSlice({
  name: "imageClassifier",
  initialState,
  reducers: {
    modelLoading: (state) => { state.status = "loading"; },
    modelReady:   (state) => { state.status = "ready"; },
    modelError:   (state) => { state.status = "error"; },
    modelReset:   (state) => { state.status = "idle"; },
  },
});

export const { modelLoading, modelReady, modelError, modelReset } = imageClassifierSlice.actions;
export default imageClassifierSlice.reducer;
