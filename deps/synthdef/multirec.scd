(
if ( ~test_inp1 == 1,
	{
		~buf_inp1 = Buffer.alloc(s, 65536, 1);
		~buf_inp1.write("/Users/canince/Documents/SCmultitrack/inplft.aiff".standardizePath, "aiff", "float", 0, 0, true);
		~trk_inp1 = Synth(\inLftDiskout, ["bufnum", ~buf_inp1],~gr1, addAction:\addToTail);
},);
if ( ~test_inp2 == 1,
	{
		~buf_inp2 = Buffer.alloc(s, 65536, 1);
		~buf_inp2.write("/Users/canince/Documents/SCmultitrack/inprgt.aiff".standardizePath, "aiff", "float", 0, 0, true);
		~trk_inp2 = Synth(\inRgtDiskout, ["bufnum", ~buf_inp2],~gr2, addAction:\addToTail);
});

)
