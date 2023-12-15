<template>
  <div class="container-fluid">
    <div class="my-4 text-center">
      <h2>ATP Designer</h2>
    </div>
    <div class="my-4 text-center">
      <a class="btn btn-success" href="javascript:window.open('simulator.html'+location.hash);">시뮬레이터</a>
      <a class="btn btn-primary" href="javascript:new_project();">새 프로젝트</a>
      <a class="btn btn-primary" href="javascript:choose_file();">프로젝트 불러오기</a>
      <a class="btn btn-primary" href="javascript:save_project();">프로젝트 저장하기</a>
      <a class="btn btn-warning" href="javascript:check_quota();">남은 저장공간 확인</a>
      <a class="btn btn-primary" href="javascript:export_data();">익스포트</a>
    </div>
    <div class="my-1 text-center">
      <h4 id="message-box">&nbsp;</h4>
    </div>
    <div class="my-4 text-center">
      <div class="container">
        <div class="row">
          <div class="col-3">
            <p>디자이너 크기</p>
            <select class="custom-select" onchange="change_led_view(this);" value="50">
              <option v-for="i in 80">{{ i }}</option>
            </select>
          </div>

          <div class="col-3">
            <p>타임라인 크기</p>
            <select class="custom-select" onchange="change_timeline(this);" value="5">
              <option v-for="i in 20"> {{ i }}</option>
            </select>
          </div>

          <div class="col-3">
            <p>LED 줄 개수</p>
            <select class="custom-select" onchange="change_ch(this);" value="16">
              <option v-for="i in 16"> {{ i }}</option>
            </select>
          </div>
          <div class="col-3">
            <p>LED 최대 갯수</p>
            <select class="custom-select" onchange="change_max(this);" value="50">
              <option v-for="i in 50">{{ i }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center">
      <table ref="designerRef"></table>
    </div>
  </div>
  <div id="color_pallet" class="ATPBox" led_color="r" led_bright="31">
    <p>100 %</p>
  </div>
  <div id="select_pallet"></div>
  <input id="theFile" type="file" style="display: none" accept=".json" onchange="onFileChoose(this)" />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  const designerRef = ref<HTMLTableElement>();

  const TIME_DIV = 8;
  const TIME_TICKS = 1000 / TIME_DIV;
  const CELL_SIZE = 30;

  onMounted(() => {
    let table = designerRef.value as HTMLTableElement;

    let t_row_h = table.insertRow(-1);
    t_row_h.style.height = CELL_SIZE + 'px';

    let t_cell_h = t_row_h.insertCell(-1);
    t_cell_h.colSpan = '2';
    t_cell_h.innerHTML = 'qwer';
    for (let i = 0; i < TIMELINE_SIZE; i++) {
      t_cell_h = t_row_h.insertCell(-1);
      t_cell_h.colSpan = '8';
      t_cell_h.innerHTML = '&nbsp;';
      table_timelines[table_timelines.length] = t_cell_h;
    }
  });
</script>
