(
~trk_DrumSmpl1.free;
~trk_DrumSmpl2.free;
~trk_DrumSmpl3.free;
~trk_DrumSmpl4.free;
~trk_DrumSmpl5.free;
~trk_DrumSmpl6.free;
~trk_DrumSmpl7.free;
~trk_DrumSmpl8.free;
~trk_Master.free;
////
if (~buf_DrumSmpl1 != nil, { ~buf_DrumSmpl1.close},);
if (~buf_DrumSmpl2 != nil, { ~buf_DrumSmpl2.close},);
if (~buf_DrumSmpl3 != nil, { ~buf_DrumSmpl3.close},);
if (~buf_DrumSmpl4 != nil, { ~buf_DrumSmpl4.close},);
if (~buf_DrumSmpl5 != nil, { ~buf_DrumSmpl5.close},);
if (~buf_DrumSmpl6 != nil, { ~buf_DrumSmpl6.close},);
if (~buf_DrumSmpl7 != nil, { ~buf_DrumSmpl7.close},);
if (~buf_DrumSmpl8 != nil, { ~buf_DrumSmpl8.close});

~buf_DrumSmpl1.free;
~buf_DrumSmpl2.free;
~buf_DrumSmpl3.free;
~buf_DrumSmpl4.free;
~buf_DrumSmpl5.free;
~buf_DrumSmpl6.free;
~buf_DrumSmpl7.free;
~buf_DrumSmpl8.free;
~masterBuf.free;



)